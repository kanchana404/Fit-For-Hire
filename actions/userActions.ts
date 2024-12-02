// actions/userActions.ts

import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/User";

interface CreateUserInput {
  clerkId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
}

export async function createUser(userData: CreateUserInput) {
  await connectToDatabase();
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Error creating user: ${error}`);
  }
}
interface UpdateUserInput {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
}

export async function updateUser(clerkId: string, updateData: UpdateUserInput) {
  await connectToDatabase();
  try {
    const user = await User.findOneAndUpdate({ clerkId }, updateData, { new: true });
    return user;
  } catch (error) {
    throw new Error(`Error updating user: ${error}`);
  }
}

export async function deleteUser(clerkId: string) {
  await connectToDatabase();
  try {
    const user = await User.findOneAndDelete({ clerkId });
    return user;
  } catch (error) {
    throw new Error(`Error deleting user: ${error}`);
  }
}
