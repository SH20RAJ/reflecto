import { db } from "@/db";
import { users as usersTable } from "@/db/schema";

async function getUsers() {
  'use server';
  try {
    const usersData = await db.select().from(usersTable);
    return usersData;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      {
        JSON.stringify(users)
      }
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.id} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}


