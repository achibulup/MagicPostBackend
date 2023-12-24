import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

type CustomerData = {
  name: string;
  email: string;
  password: string;
};

type EmployeeData = {
  name: string;
  email: string;
  password: string;
  phone: string;
} & (
  {
    role: "manager" | "staff";
    pickupPointId: number;
    transitHubId: null;
  } | {
    role: "manager" | "staff";
    pickupPointId: null;
    transitHubId: number;
  } | {
    role: "shipper";
    pickupPointId: null;
    transitHubId: null;
  }
);

type OrderData = {
  senderId: number;
  weight: number;
  receiverNumber: string;
  receiverAddress: string;
  pickupFrom: number;
  pickupTo: number;
  sendDate: string;
};

type PackageData = {
  pickupFrom: number;
  pickupTo: number;
  shipperId: number | null;
}

type TransitHubData = {
  name: string;
  location: string;
};

type PickupPointData = {
  name: string;
  location: string;
  hubId: number;
};

export async function createCustomer({ name, email, password }: CustomerData) {
  return sql`
    INSERT INTO users (name, email, password)
    VALUES (${name}, ${email}, ${password})
  `;
}

export async function getCustomerById(id: number) {
  return sql<Customer>`
    SELECT * FROM customers WHERE id = ${id}
  `;
}

export async function getCustomerByEmail(email: string) {
  return sql<Customer>`
    SELECT * FROM customers WHERE email = ${email}
  `;
}

export async function changeCustomerPassword(id: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  return sql`
    UPDATE customers
    SET password = ${hashedPassword}
    WHERE id = ${id}
  `;
}

export async function deleteCustomer(id: number) {
  return sql`
    DELETE FROM customers WHERE id = ${id}
  `;
}

export async function createEmployee({
  name,
  email,
  password,
  phone,
  role,
  pickupPointId,
  transitHubId,
}: EmployeeData) {
  return sql`
    INSERT INTO employees (name, email, password, phone, role, pickup_point_id, transit_hub_id)
    VALUES (${name}, ${email}, ${password}, ${phone}, ${role}, ${pickupPointId}, ${transitHubId})
  `;
}

export async function getEmployeeById(id: number) {
  return sql<Employee>`
    SELECT * FROM employees WHERE id = ${id}
  `;
}

export async function getEmployeeByEmail(email: string) {
  return sql<Employee>`
    SELECT * FROM employees WHERE email = ${email}
  `;
}

export async function changeEmployeePassword(id: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  return sql`
    UPDATE employees
    SET password = ${hashedPassword}
    WHERE id = ${id}
  `;
}

export async function createOrder({
  senderId,
  weight,
  receiverNumber,
  receiverAddress,
  pickupFrom,
  pickupTo,
  sendDate,
}: OrderData) {
  return sql`
    INSERT INTO orders (sender_id, weight, receiver_number, receiver_address, pickup_from, pickup_to, send_date)
    VALUES (${senderId}, ${weight}, ${receiverNumber}, ${receiverAddress}, ${pickupFrom}, ${pickupTo}, ${sendDate})
  `;
}

export async function getOrderById(id: number) {
  return sql<Order>`
    SELECT * FROM orders WHERE id = ${id}
  `;
}

export async function orderDelivering(id: number) {
  return sql`
    UPDATE orders
    SET status = 'delivering'
    WHERE id = ${id}
  `;
}

export async function orderDelivered(id: number, arrivalDate: string) {
  return sql`
    UPDATE orders
    SET status = 'delivered', arrival_date = ${arrivalDate}
    WHERE id = ${id}
  `;
}

export async function orderCancelled(id: number) {
  return sql`
    UPDATE orders
    SET status = 'cancelled'
    WHERE id = ${id}
  `;
}

export async function createPackage({
  pickupFrom,
  pickupTo,
  shipperId,
}: PackageData) {
  return sql`
    INSERT INTO packages (pickup_from, pickup_to, shipper_id)
    VALUES (${pickupFrom}, ${pickupTo}, ${shipperId})
  `;
}

export async function getPackageById(id: number) {
  return sql<Package>`
    SELECT * FROM packages WHERE id = ${id}
  `;
}

export async function addOrderToPackage(orderId: number, packageId: number) {
  return Promise.all([sql`
    UPDATE orders
    SET package_id = ${packageId}
    WHERE id = ${orderId}
  `, sql`
    UPDATE packages
    SET quantity = quantity + 1, weight = weight + (SELECT weight FROM orders WHERE id = ${orderId})
    WHERE id = ${packageId}
  `]);
}

export async function packageDelivering1(id: number, transitDate: string) {
  return sql`
    UPDATE packages
    SET status = 'delivering1', transit_date = ${transitDate}
    WHERE id = ${id}
  `;
}

export async function packageDelivering2(id: number) {
  return sql`
    UPDATE packages
    SET status = 'delivering2'
    WHERE id = ${id}
  `;
}

export async function packageDelivering3(id: number) {
  return sql`
    UPDATE packages
    SET status = 'delivering3'
    WHERE id = ${id}
  `;
}

export async function packageDelivered(id: number, arrivalDate: string) {
  return sql`
    UPDATE packages
    SET status = 'delivered', arrival_date = ${arrivalDate}
    WHERE id = ${id}
  `;
}

export async function createTransitHub({ name, location }: TransitHubData) {
  return sql`
    INSERT INTO transit_hubs (name, location)
    VALUES (${name}, ${location})
  `;
}

export async function getTransitHubById(id: number) {
  return sql<TransitHub>`
    SELECT * FROM transit_hubs WHERE id = ${id}
  `;
}

export async function getTransitHubByName(name: string) {
  return sql<TransitHub>`
    SELECT * FROM transit_hubs WHERE name = ${name}
  `;
}

export async function createPickupPoint({ name, location, hubId }: PickupPointData) {
  return sql`
    INSERT INTO pickup_points (name, location, hub_id)
    VALUES (${name}, ${location}, ${hubId})
  `;
}

export async function getPickupPointById(id: number) {
  return sql<PickupPoint>`
    SELECT * FROM pickup_points WHERE id = ${id}
  `;
}

export async function getPickupPointByName(name: string) {
  return sql<PickupPoint>`
    SELECT * FROM pickup_points WHERE name = ${name}
  `;
}



