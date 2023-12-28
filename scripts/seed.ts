import { VercelPoolClient, db } from "@vercel/postgres"
import * as actions from "../database/actions";
import dotenv from "dotenv";

import data from "../database/placeholder-data.json";

// async function createCustomerTable(client: VercelPoolClient) {
//   await client.sql`
//     DROP TABLE IF EXISTS customers CASCADE;
//   `;
//   return client.sql`
//     CREATE TABLE IF NOT EXISTS customers (
//       id SERIAL PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) UNIQUE NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       phone VARCHAR(255) NOT NULL
//     );
//   `;
// }

// async function seedCustomerTable(client: VercelPoolClient) {
//   await Promise.all(data.customers.map(async (customer) => {
//     return actions.createCustomer(customer);
//   }));
//   console.log("Finished seeding customers");
// }
async function createTransitHubTable(client: VercelPoolClient) {
  await client.sql`
    DROP TABLE IF EXISTS "transitHubs" CASCADE;
  `;
  await client.sql`
    CREATE TABLE IF NOT EXISTS "transitHubs" (
      "id" SERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "location" VARCHAR(255) NOT NULL
    );
  `;
}

async function seedTransitHubTable(client: VercelPoolClient) {
  await Promise.all(data.transitHubs.map(async (transitHub) => {
    return actions.createTransitHub(transitHub);
  }));
  console.log("Finished seeding transit hubs");
}

async function createPickupPointTable(client: VercelPoolClient) {
  await client.sql`
    DROP TABLE IF EXISTS "pickupPoints" CASCADE;
  `;
  await client.sql`
    CREATE TABLE IF NOT EXISTS "pickupPoints" (
      "id" SERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "location" VARCHAR(255) NOT NULL,
      "hub" INTEGER NOT NULL REFERENCES "transitHubs"("id")
    );
  `;
}

async function seedPickupPointTable(client: VercelPoolClient) {
  await Promise.all(data.pickupPoints.map(async (pickupPoint) => {
    console.log(JSON.stringify(pickupPoint));
    const formatPickupPoint = { 
      ...pickupPoint, 
      hub: (await actions.getTransitHubByName(pickupPoint.hub)).id 
    };
    return actions.createPickupPoint(formatPickupPoint as PickupPointData);
  }));
  console.log("Finished seeding pickup points");
}

async function createAccountTable(client: VercelPoolClient) {
  await client.sql`
    DROP TABLE IF EXISTS "accounts" CASCADE;
  `;
  return client.sql`
    CREATE TABLE IF NOT EXISTS "accounts" (
      "id" SERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "email" VARCHAR(255) UNIQUE NOT NULL,
      "password" VARCHAR(255) NOT NULL,
      "phone" VARCHAR(255) NOT NULL,
      "role" VARCHAR(255) NOT NULL,
      "status" VARCHAR(255) NOT NULL DEFAULT 'active',
      "pickupPoint" INTEGER REFERENCES "pickupPoints"("id"),
      "transitHub" INTEGER REFERENCES "transitHubs"("id")
    );
  `;
}

async function seedAccountTable(client: VercelPoolClient) {
  await Promise.all(data.accounts.map(async (account) => {
    const formatAccount = {
      ...account,
      pickupPoint: account.pickupPoint && (await actions.getPickupPointByName(account.pickupPoint)).id,
      transitHub: account.transitHub && (await actions.getTransitHubByName(account.transitHub)).id,
    };
    return actions.createAccount(formatAccount as AccountData);
  }));
}

async function createPackageTable(client: VercelPoolClient) {
  await client.sql`
    DROP TABLE IF EXISTS "packages" CASCADE;
  `;
  return client.sql`
    CREATE TABLE IF NOT EXISTS "packages" (
      "id" SERIAL PRIMARY KEY,
      "quantity" INTEGER NOT NULL DEFAULT 0,
      "weight" FLOAT NOT NULL DEFAULT 0,
      "pickupFrom" INTEGER NOT NULL REFERENCES "pickupPoints"("id"),
      "pickupTo" INTEGER NOT NULL REFERENCES "pickupPoints"("id"),
      "transitDate" DATE,
      "arrivalDate" DATE,
      "shipper" INTEGER REFERENCES "accounts"("id"),
      "status" VARCHAR(255) NOT NULL DEFAULT 'pending'
    );
  `;
}

async function seedPackageTable(client: VercelPoolClient) {
  await Promise.all(data.packages.map(async (pk) => {
    const formatpk = { 
      ...pk, 
      pickupFrom: (await actions.getPickupPointByName(pk.pickupFrom)).id,
      pickupTo: (await actions.getPickupPointByName(pk.pickupTo)).id,
      shipper: (await actions.getAccountByEmail(pk.shipper)).id,
      transitDate: pk.transitDate && new Date(pk.transitDate),
      arrivalDate: pk.arrivalDate && new Date(pk.arrivalDate),
    };
    return actions.createPackage(formatpk as PackageData);
  }));
}

async function createOrderTable(client: VercelPoolClient) {
  await client.sql`
    DROP TABLE IF EXISTS "orders" CASCADE;
  `;
  return client.sql`
    CREATE TABLE IF NOT EXISTS "orders" (
      "id" SERIAL PRIMARY KEY,
      "weight" FLOAT NOT NULL DEFAULT 0,
      "sender" INTEGER NOT NULL REFERENCES "customers"("id"),
      "receiverNumber" VARCHAR(255) NOT NULL,
      "receiverAddress" VARCHAR(255) NOT NULL,
      "pickupFrom" INTEGER NOT NULL REFERENCES "pickupPoints"("id"),
      "pickupTo" INTEGER NOT NULL REFERENCES "pickupPoints"("id"),
      "sendDate" DATE,
      "package" INTEGER REFERENCES "packages"("id"),
      "arrivalDate" DATE,
      "charge" FLOAT NOT NULL,
      "shipper" INTEGER REFERENCES "accounts"("id"),
      "status" VARCHAR(255) NOT NULL DEFAULT 'pending'
    );
  `;
}

async function seedOrderTable(client: VercelPoolClient) {
  await Promise.all(data.orders.map(async (order) => {
    const formatOrder = { 
      ...order, 
      pickupFrom: (await actions.getPickupPointByName(order.pickupFrom)).id,
      pickupTo: (await actions.getPickupPointByName(order.pickupTo)).id,
      shipper: order.shipper && (await actions.getAccountByEmail(order.shipper)).id,
      sendDate: order.sendDate && new Date(order.sendDate),
      arrivalDate: order.arrivalDate && new Date(order.arrivalDate),
    };
    return actions.createOrder(formatOrder as OrderData);
  }));
  console.log("Finished seeding orders");
}

// Continue with the rest of the functions...

async function main() {
  const client = await db.connect();

  await Promise.all([
    createTransitHubTable(client),
    createPickupPointTable(client),
    createAccountTable(client),
    createPackageTable(client),
    createOrderTable(client),
  ]);

  console.log("Finished creating tables");

  await seedTransitHubTable(client);
  await seedPickupPointTable(client);
  await seedAccountTable(client);
  await seedPackageTable(client);
  await seedOrderTable(client);

  console.log("Finished seeding tables");

  client.release();
}

main();

