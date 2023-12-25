import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export async function createCustomer({ name, email, password, phone }: CustomerData) {
  return sql`
    INSERT INTO customers (name, email, password, phone)
    VALUES (${name}, ${email}, ${password}, ${phone})
  `;
}

export async function getCustomerById(id: number) {
  return sql<Customer>`
    SELECT * FROM customers WHERE id = ${id}
  `.then((res) => res.rows[0]);
}

export async function getCustomerByEmail(email: string) {
  return sql<Customer>`
    SELECT * FROM customers WHERE email = ${email}
  `.then((res) => res.rows[0]);
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
  pickupPoint,
  transitHub,
}: EmployeeData) {
  return sql`
    INSERT INTO employees (name, email, password, phone, role, pickup_point, transit_hub)
    VALUES (${name}, ${email}, ${password}, ${phone}, ${role}, ${pickupPoint}, ${transitHub})
  `;
}

export async function getEmployeeById(id: number) {
  return sql<Employee>`
    SELECT * FROM employees WHERE id = ${id}
  `.then((res) => res.rows[0]);
}

export async function getEmployeeByEmail(email: string) {
  return sql<Employee>`
    SELECT * FROM employees WHERE email = ${email}
  `.then((res) => res.rows[0]);
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
  sender,
  weight,
  receiverNumber,
  receiverAddress,
  pickupFrom,
  pickupTo,
  sendDate,
  arrivalDate,
  shipper,
  status
}: OrderData) {
  const formattedSendDate = sendDate.toISOString();
  const formattedArrivalDate = arrivalDate ? arrivalDate.toISOString() : null;
  status = status || "pending";
  return sql`
    INSERT INTO orders (sender, weight, receiver_number, receiver_address, pickup_from, pickup_to, shipper, send_date, arrival_date, status)
    VALUES (${sender}, ${weight}, ${receiverNumber}, ${receiverAddress}, ${pickupFrom}, ${pickupTo}, 
            ${shipper}, ${formattedSendDate}, ${formattedArrivalDate}, ${status})
  `;
}

function reformatOrder(order: Order)
{
    return {
      ...order, 
      sendDate: order.sendDate ? new Date(order.sendDate) : null, 
      arrivalDate: order.arrivalDate ? new Date(order.arrivalDate) : null
    };
}

export async function getOrderById(id: number) {
  return sql<Order>`
    SELECT * FROM orders WHERE id = ${id}
  `.then((res) => reformatOrder(res.rows[0]));
}

export async function orderDelivering(id: number) {
  return sql`
    UPDATE orders
    SET status = 'delivering'
    WHERE id = ${id}
  `;
}

export async function orderDelivered(id: number, arrivalDate: Date) {
  const formattedArrivalDate = arrivalDate.toISOString();
  return sql`
    UPDATE orders
    SET status = 'delivered', arrival_date = ${formattedArrivalDate}
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
  shipper,
  transitDate,
  arrivalDate,
  status,
}: PackageData) {
  const formattedTransitDate = transitDate ? transitDate.toISOString() : null;
  const formattedArrivalDate = arrivalDate ? arrivalDate.toISOString() : null;
  status = status || "pending";
  return sql`
    INSERT INTO packages (pickup_from, pickup_to, shipper, transit_date, arrival_date, status)
    VALUES (${pickupFrom}, ${pickupTo}, ${shipper}, ${formattedTransitDate}, ${formattedArrivalDate}, ${status})
  `;
} 

function reformatPackage(pk: Package)
{
    return {
      ...pk, 
      transitDate: pk.transitDate ? new Date(pk.transitDate) : null, 
      arrivalDate: pk.arrivalDate ? new Date(pk.arrivalDate) : null
    };
}

export async function getPackageById(id: number) {
  return sql<Package>`
    SELECT * FROM packages WHERE id = ${id}
  `.then((res) => reformatPackage(res.rows[0]));
}

export async function addOrderToPackage(orderId: number, packageId: number) {
  return Promise.all([sql`
    UPDATE orders
    SET package = ${packageId}
    WHERE id = ${orderId}
  `, sql`
    UPDATE packages
    SET quantity = quantity + 1, weight = weight + (SELECT weight FROM orders WHERE id = ${orderId})
    WHERE id = ${packageId}
  `]);
}

export async function packageDelivering1(id: number, transitDate: Date) {
  const formattedTransitDate = transitDate.toISOString();
  return sql`
    UPDATE packages
    SET status = 'delivering1', transit_date = ${formattedTransitDate}
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
  `.then((res) => res.rows[0]);
}

export async function getTransitHubByName(name: string) {
  console.log('getTransitHubByName', name);
  return sql<TransitHub>`
    SELECT * FROM transit_hubs WHERE name = ${name}
  `.then((res) => res.rows[0]);
}

export async function createPickupPoint({ name, location, hub }: PickupPointData) {
  return sql`
    INSERT INTO pickup_points (name, location, hub)
    VALUES (${name}, ${location}, ${hub})
  `;
}

export async function getPickupPointById(id: number) {
  return sql<PickupPoint>`
    SELECT * FROM pickup_points WHERE id = ${id}
  `.then((res) => res.rows[0]);
}

export async function getPickupPointByName(name: string) {
  return sql<PickupPoint>`
    SELECT * FROM pickup_points WHERE name = ${name}
  `.then((res) => res.rows[0]);
}



