import { MongoClient, ObjectId, Document } from "mongodb";
import { User, Task, UserMetadata } from "./types";
import { fetchUserMetadataFromForecaster } from "./forecasterMock";

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "needify";

let client: MongoClient | null = null;
let isConnecting = false;

async function getClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (isConnecting) {
    // Wait for the connection to be established
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return client!;
  }

  try {
    isConnecting = true;
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
}

export class DBService {
  static async getCollection<T extends Document>(name: string) {
    const client = await getClient();
    return client.db(DB_NAME).collection<T>(name);
  }

  static async getUser(address: string): Promise<User | null> {
    const users = await this.getCollection<User>("users");
    return users.findOne({ address });
  }

  static async getOrCreateUser(address: string, metadata: UserMetadata): Promise<User> {
    const users = await this.getCollection<User>("users");
    let user = await users.findOne<User>({ address });

    if (!user) {
      user = {
        address,
        full_name: metadata.full_name,
        avatar: metadata.avatar,
        forecaster_id: metadata.forecaster_id,
        forecaster_nickname: metadata.forecaster_nickname,
        created_at: new Date(),
      };
      await users.insertOne(user);
    } else {
      // Update existing user with new metadata
      await users.updateOne(
        { address },
        {
          $set: {
            full_name: metadata.full_name,
            avatar: metadata.avatar,
            forecaster_id: metadata.forecaster_id,
            forecaster_nickname: metadata.forecaster_nickname,
          },
        }
      );
      user = await users.findOne<User>({ address }) as User;
    }

    return user;
  }

  static async createTask(input: {
    owner: string;
    title: string;
    description: string;
    asset: string;
    amount: number;
    category: string;
    deadline?: Date | null;
  }): Promise<Task> {
    const tasks = await this.getCollection("tasks");

    const task: Omit<Task, '_id'> = {
      owner: input.owner,
      title: input.title,
      description: input.description,
      asset: input.asset,
      amount: input.amount,
      deadline: input.deadline ?? null,
      executor: null,
      taken_at: null,
      owner_approved: false,
      executor_approved: false,
      category: input.category,
      created_at: new Date(),
    };

    const result = await tasks.insertOne(task);
    return { ...task, _id: result.insertedId.toHexString() };
  }

  static async getMarketTasks(user_address: string): Promise<Task[]> {
    const tasks = await this.getCollection("tasks");
    return await tasks
      .find<Task>({ owner: { $ne: user_address }, executor: null })
      .toArray();
  }

  static async getUserTasks(user_address: string): Promise<Task[]> {
    const tasks = await this.getCollection("tasks");
    return await tasks
      .find<Task>({
        $or: [{ owner: user_address }, { executor: user_address }],
      })
      .toArray();
  }

  static async applyTask(taskId: string, user_address: string): Promise<void> {
    const tasks = await this.getCollection("tasks");
    const task = await tasks.findOne<Task>({ _id: new ObjectId(taskId) });

    if (!task) throw new Error("Task not found");
    if (task.owner === user_address)
      throw new Error("Owner cannot apply to their own task");
    if (task.executor) throw new Error("Task already taken");

    // mock interaction with YellowProvider
    const { channel_id } = YellowProvider.startTask(taskId);

    await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          executor: user_address,
          taken_at: new Date(),
          channel_id: channel_id,
        },
      }
    );
  }

  static async approveTask(taskId: string, user_address: string): Promise<void> {
    const tasks = await this.getCollection("tasks");
    const task = await tasks.findOne<Task>({ _id: new ObjectId(taskId) });

    if (!task) throw new Error("Task not found");

    const updateFields: Partial<Task> = {};

    if (task.owner === user_address) {
      updateFields.owner_approved = true;
    } else if (task.executor === user_address) {
      updateFields.executor_approved = true;
    } else {
      throw new Error("User not part of this task");
    }

    await tasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updateFields }
    );

    const updated = await tasks.findOne<Task>({ _id: new ObjectId(taskId) });
    if (updated?.owner_approved && updated?.executor_approved) {
      if (!updated.channel_id) throw new Error("Missing channel_id for YellowProvider finalization");

      YellowProvider.finalTask(taskId, updated.channel_id);
    }
  }
}

// Мок-интерфейс YellowProvider
const YellowProvider = {
  startTask(taskId: string): { channel_id: string } {
    const channel_id = `channel_${taskId.slice(-6)}`;
    console.log(`[YellowProvider] Task ${taskId} started. Channel: ${channel_id}`);
    return { channel_id };
  },
  finalTask(taskId: string, channel_id: string) {
    console.log(`[YellowProvider] Task ${taskId} finalized via channel ${channel_id}`);
  },
};
