import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';
// import type { Account, Order, Package, PickupPoint, TransitHub, AccountData, CustomerData, OrderData, PackageData, PickupPointData, TransitHubData } from './definitions';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

// export async function createCustomer({ name, email, password, phone }: CustomerData) {
//   return sql`
//     INSERT INTO customers (name, email, password, phone)
//     VALUES (${name}, ${email}, ${password}, ${phone})
//   `;
// }

type EmployeeFilter = {
  name?: string;
  email?: string;
  role?: string;
  pickupPoint?: number;
  transitHub?: number;
};

export type OrderFilter = {
  sender?: number;
  receiverNumber?: string;
  receiverAddress?: string;
  package?: number;
  pickup: number; // pickupFrom or pickupTo
  pickupFrom?: undefined;
  pickupTo?: undefined;
  shipper?: number;
  status?: string;
} | {
  sender?: number;
  receiverNumber?: string;
  receiverAddress?: string;
  package?: number;
  pickup?: undefined; // pickupFrom or pickupTo
  pickupFrom?: number;
  pickupTo?: number;
  shipper?: number;
  status?: string;
};

export type PackageFilter = {
  id?: number;
  status?: string;
} & ({
  pickup?: number; // pickupFrom or pickupTo
} | {
  hub?: number; // hubFrom or hubTo
} | (
  ({ pickupFrom?: number; } | { hubFrom?: number; })
  & ({ pickupTo?: number; } | { hubTo?: number; })
));


// export async function getCustomerById(id: number) {
//   return sql<Customer>`
//     SELECT * FROM customers WHERE id = ${id}
//   `.then((res) => res.rows[0]);
// }

// export async function getCustomerByEmail(email: string) {
//   return sql<Customer>`
//     SELECT * FROM customers WHERE email = ${email}
//   `.then((res) => res.rows[0]);
// }

// export async function changeCustomerPassword(id: number, newPassword: string) {
//   const hashedPassword = await hashPassword(newPassword);
//   return sql`
//     UPDATE customers
//     SET password = ${hashedPassword}
//     WHERE id = ${id}
//   `;
// }

// export async function deleteCustomer(id: number) {
//   return sql`
//     DELETE FROM customers WHERE id = ${id}
//   `;
// }

export async function createAccount({
  name,
  email,
  password,
  phone,
  role,
  pickupPoint,
  transitHub,
}: AccountData) {
  const hashedPassword = await hashPassword(password);
  return sql`
    INSERT INTO "accounts" ("name", "email", "password", "phone", "role", "pickupPoint", "transitHub")
    VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, ${role}, ${pickupPoint}, ${transitHub})
  `;
}

export async function getAccountById(id: number) {
  return sql<Account>`
    SELECT * FROM "accounts" WHERE "id" = ${id}
  `.then((res) => res.rows[0]);
}

export async function getAccountByEmail(email: string) {
  return sql<Account>`
    SELECT * FROM "accounts" WHERE "email" = ${email}
  `.then((res) => res.rows[0]);
}

export async function getEmployees(filter: EmployeeFilter) {
  const { name, email, role, pickupPoint, transitHub } = filter;
  const doFilterName = name ? 1 : 0;
  const doFilterEmail = email ? 1 : 0;
  const doFilterRole = role ? 1 : 0;
  const doFilterPickupPoint = pickupPoint ? 1 : 0;
  const doFilterTransitHub = transitHub ? 1 : 0;
  return sql<Account>`
    SELECT * FROM "accounts"
    WHERE 
      (${doFilterName} = 0 OR "name" = ${name}) AND
      (${doFilterEmail} = 0 OR "email" = ${email}) AND
      (${doFilterRole} = 0 OR "role" = ${role}) AND
      (${doFilterPickupPoint} = 0 OR "pickupPoint" = ${pickupPoint}) AND
      (${doFilterTransitHub} = 0 OR "transitHub" = ${transitHub}) 
  `.then((res) => res.rows);
}

export async function changeAccountPassword(id: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  return sql`
    UPDATE "accounts"
    SET "password" = ${hashedPassword}
    WHERE "id" = ${id}
  `;
}


function reformatOrder(order: Order): Order
{
    return {
      ...order, 
      sendDate: new Date(order.sendDate), 
      arrivalDate: order.arrivalDate ? new Date(order.arrivalDate) : null
    };
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
  charge,
  shipper,
  status
}: OrderData) {
  const formattedSendDate = sendDate.toISOString();
  const formattedArrivalDate = arrivalDate ? arrivalDate.toISOString() : null;
  status = status || "pending";
  return sql`
    INSERT INTO "orders" ("sender", "weight", "receiverNumber", "receiverAddress", "pickupFrom", "pickupTo", "shipper", "sendDate", "arrivalDate", "charge", "status")
    VALUES (${sender}, ${weight}, ${receiverNumber}, ${receiverAddress}, ${pickupFrom}, ${pickupTo}, 
            ${shipper}, ${formattedSendDate}, ${formattedArrivalDate}, ${charge}, ${status})
  `;
}

export async function getOrderById(id: number) {
  return sql<Order>`
    SELECT * FROM "orders" WHERE "id" = ${id}
  `.then((res) => reformatOrder(res.rows[0]));
}

export async function getOrders(filter: OrderFilter) {
  const { sender, receiverNumber, receiverAddress, pickup, pickupFrom, pickupTo, shipper, status } = filter;
  const pk = filter.package;
  const doFilterSender = sender ? 1 : 0;
  const doFilterReceiverNumber = receiverNumber ? 1 : 0;
  const doFilterReceiverAddress = receiverAddress ? 1 : 0;
  const doFilterPackage = pk ? 1 : 0;
  const doFilterPickup = pickup ? 1 : 0;
  const doFilterPickupFrom = pickupFrom ? 1 : 0;
  const doFilterPickupTo = pickupTo ? 1 : 0;
  const doFilterShipper = shipper ? 1 : 0;
  const doFilterStatus = status ? 1 : 0;
  return sql<Order>`
    SELECT * FROM "orders"
    WHERE 
      (${doFilterSender} = 0 OR "sender" = ${sender}) AND
      (${doFilterReceiverNumber} = 0 OR "receiverNumber" = ${receiverNumber}) AND
      (${doFilterReceiverAddress} = 0 OR "receiverAddress" = ${receiverAddress}) AND
      (${doFilterPackage} = 0 OR "package" = ${pk}) AND
      (${doFilterPickup} = 0 OR "pickupFrom" = ${pickup} OR "pickupTo" = ${pickup}) AND
      (${doFilterPickupFrom} = 0 OR "pickupFrom" = ${pickupFrom}) AND
      (${doFilterPickupTo} = 0 OR "pickupTo" = ${pickupTo}) AND
      (${doFilterShipper} = 0 OR "shipper" = ${shipper}) AND
      (${doFilterStatus} = 0 OR "status" = ${status})
    ORDER BY "sendDate" DESC
  `.then((res) => res.rows.map(reformatOrder));
}

export async function setOrderShipper(id: number, shipper?: number | null) {
  return sql`
    UPDATE "orders"
    SET "shipper" = ${shipper}
    WHERE "id" = ${id}
  `;
}

export async function orderDelivered(id: number, arrivalDate: Date) {
  const formattedArrivalDate = arrivalDate.toISOString();
  return sql`
    UPDATE "orders"
    SET "status" = 'delivered', "arrivalDate" = ${formattedArrivalDate}
    WHERE "id" = ${id}
  `;
}

export async function orderCancelled(id: number) {
  return sql`
    UPDATE "orders"
    SET "status" = 'cancelled'
    WHERE "id" = ${id}
  `;
}

function reformatPackage<P extends Package>(pk: P) : P
{
    return {
      ...pk, 
      transitDate: pk.transitDate ? new Date(pk.transitDate) : null, 
      arrivalDate: pk.arrivalDate ? new Date(pk.arrivalDate) : null
    };
}

export async function createPackage({
  pickupFrom,
  pickupTo,
  transitDate,
  arrivalDate,
  status,
}: PackageData) {
  const formattedTransitDate = transitDate ? transitDate.toISOString() : null;
  const formattedArrivalDate = arrivalDate ? arrivalDate.toISOString() : null;
  status = status || "pending";
  return sql`
    INSERT INTO "packages" ("pickupFrom", "pickupTo", "transitDate", "arrivalDate", "status")
    VALUES (${pickupFrom}, ${pickupTo}, ${formattedTransitDate}, ${formattedArrivalDate}, ${status}) RETURNING "id"
  `.then((res) => res.rows[0].id as number);
}

export async function getPackages(filter: PackageFilter) {
  const { id, pickup, pickupFrom, pickupTo, hub, hubFrom, hubTo, status } = filter as {
    pickup?: number;
    pickupFrom?: number;
    pickupTo?: number;
    hub?: number;
    hubFrom?: number;
    hubTo?: number;
    id?: number;
    status?: string;
  };
  const doFilterId = id ? 1 : 0;
  const doFilterPickup = pickup ? 1 : 0;
  const doFilterPickupFrom = pickupFrom ? 1 : 0;
  const doFilterPickupTo = pickupTo ? 1 : 0;
  const doFilterHub = hub ? 1 : 0;
  const doFilterHubFrom = hubFrom ? 1 : 0;
  const doFilterHubTo = hubTo ? 1 : 0;
  const doFilterStatus = status ? 1 : 0;
  if (doFilterHub) {
    return sql<Package & { hubFrom: number, }>`
      SELECT p.*, FROM "packages" p
      JOIN "pickupPoints" pp1 ON p."pickupFrom" = pp1.id
      JOIN "pickupPoints" pp2 ON p."pickupTo" = pp2.id 
      WHERE
        (pp1."hub" = ${hubFrom} OR pp2."hub" = ${hubTo}) AND
        (${doFilterId} = 0 OR "id" = ${id}) AND
        (${doFilterStatus} = 0 OR "status" = ${status})
      ORDER BY "transitDate" DESC
    `.then((res) => res.rows.map(reformatPackage));
  } else if (doFilterPickup) {
    return sql<Package>`
      SELECT p.* FROM "packages" p
      WHERE
        (p."pickupFrom" = ${pickup} OR p."pickupTo" = ${pickup}) AND
        (${doFilterId} = 0 OR "id" = ${id}) AND
        (${doFilterStatus} = 0 OR "status" = ${status})
      ORDER BY "transitDate" DESC
    `.then((res) => res.rows.map(reformatPackage));
  } else if (doFilterHubFrom) {
    if (doFilterHubTo) {
      return sql<Package>`
        SELECT p.* FROM "packages" p
        JOIN "pickupPoints" pp1 ON p."pickupFrom" = pp1.id
        JOIN "pickupPoints" pp2 ON p."pickupTo" = pp2.id 
        WHERE
          pp1."hub" = ${hubFrom} AND pp2."hub" = ${hubTo} AND
          (${doFilterId} = 0 OR "id" = ${id}) AND
          (${doFilterStatus} = 0 OR "status" = ${status})
        ORDER BY "transitDate" DESC
      `.then((res) => res.rows.map(reformatPackage));
    } else {
      return sql<Package>`
        SELECT p.* FROM "packages" p
        JOIN "pickupPoints" pp1 ON p."pickupFrom" = pp1.id
        WHERE
          pp1."hub" = ${hubFrom} AND
          (${doFilterPickupTo} = 0 OR "pickupTo" = ${pickupTo}) AND
          (${doFilterId} = 0 OR "id" = ${id})
          (${doFilterStatus} = 0 OR "status" = ${status})
        ORDER BY "transitDate" DESC
      `.then((res) => res.rows.map(reformatPackage));
    }
  } else {
    if (doFilterHubTo) {
      return sql<Package>`
        SELECT p.* FROM "packages" p
        JOIN "pickupPoints" pp2 ON p."pickupTo" = pp2.id 
        WHERE
          pp2."hub" = ${hubTo} AND
          (${doFilterPickupFrom} = 0 OR "pickupFrom" = ${pickupFrom}) AND
          (${doFilterId} = 0 OR "id" = ${id}) AND
          (${doFilterStatus} = 0 OR "status" = ${status})
        ORDER BY "transitDate" DESC
      `.then((res) => res.rows.map(reformatPackage));
    } else {
      return sql<Package>`
        SELECT p.* FROM "packages"
        WHERE 
          (${doFilterPickupFrom} = 0 OR "pickupFrom" = ${pickupFrom}) AND
          (${doFilterPickupTo} = 0 OR "pickupTo" = ${pickupTo}) AND
          (${doFilterId} = 0 OR "id" = ${id}) AND
          (${doFilterStatus} = 0 OR "status" = ${status})
        ORDER BY "transitDate" DESC
      `.then((res) => res.rows.map(reformatPackage));
    }
  }
}

export async function getPackageById(id: number) {
  return sql<Package>`
    SELECT * FROM "packages" WHERE "id" = ${id}
  `.then((res) => reformatPackage(res.rows[0]));
}

export async function addOrderToPackage(orderId: number, packageId: number) {
  return Promise.all([sql`
    UPDATE "orders"
    SET "package" = ${packageId}
    WHERE "id" = ${orderId}
  `, sql`
    UPDATE "packages"
    SET "quantity" = "quantity" + 1, "weight" = "weight" + (SELECT "weight" FROM "orders" WHERE "id" = ${orderId})
    WHERE "id" = ${packageId}
  `]);
}

export async function setPackageStatus(id: number, status: string, transitDate?: Date) {
  if (transitDate) {
    const formattedTransitDate = transitDate.toISOString();
    return sql`
      UPDATE "packages"
      SET "status" = ${status}, "transitDate" = ${formattedTransitDate}
      WHERE "id" = ${id}
    `;
  } else {
    return sql`
      UPDATE "packages"
      SET "status" = ${status}
      WHERE "id" = ${id}
    `;
  }
}

export async function packageDelivering1(id: number, transitDate: Date) {
  const formattedTransitDate = transitDate.toISOString();
  return sql`
    UPDATE "packages"
    SET "status" = 'delivering1', "transitDate" = ${formattedTransitDate}
    WHERE "id" = ${id}
  `.then(async () => sql`
    UPDATE "orders"
    SET "status" = 'delivering1'
    WHERE "package" = ${id}
  `);
}

export async function packageDelivering2(id: number) {
  return sql`
    UPDATE "packages"
    SET "status" = 'delivering2'
    WHERE "id" = ${id}
  `;
}

export async function packageDelivering3(id: number) {
  return sql`
    UPDATE "packages"
    SET "status" = 'delivering3'
    WHERE "id" = ${id}
  `;
}

export async function packageDelivered(id: number, arrivalDate: Date) {
  const formattedArrivalDate = arrivalDate.toISOString();
  return sql`
    UPDATE "packages"
    SET "status" = 'delivered', "arrivalDate" = ${formattedArrivalDate}
    WHERE "id" = ${id}
  `.then(async () => sql`
    UPDATE "orders"
    SET "status" = 'delivering2'
    WHERE "package" = ${id}
  `);
}

export async function createTransitHub({ name, location }: TransitHubData) {
  return sql`
    INSERT INTO "transitHubs" ("name", "location")
    VALUES (${name}, ${location})
  `.then(async () => console.log(await getTransitHubByName(name)));
}

export async function getTransitHubById(id: number) {
  return sql<TransitHub>`
    SELECT * FROM "transitHubs" WHERE "id" = ${id}
  `.then((res) => res.rows[0]);
}

export async function getTransitHubByName(name: string) {
  console.log('getTransitHubByName', name);
  return sql<TransitHub>`
    SELECT * FROM "transitHubs" WHERE "name" = ${name}
  `.then((res) => res.rows[0]);
}

export async function createPickupPoint({ name, location, hub }: PickupPointData) {
  return sql`
    INSERT INTO "pickupPoints" ("name", "location", "hub")
    VALUES (${name}, ${location}, ${hub})
  `;
}

export async function getPickupPointById(id: number) {
  return sql<PickupPoint>`
    SELECT * FROM "pickupPoints" WHERE "id" = ${id}
  `.then((res) => res.rows[0]);
}

export async function getPickupPointByName(name: string) {
  return sql<PickupPoint>`
    SELECT * FROM "pickupPoints" WHERE "name" = ${name}
  `.then((res) => res.rows[0]);
}

export async function getCustomersByPickupPoint(pickupPoint: number) {
  return sql<Account>`
    SELECT "a".* FROM "accounts" "a" JOIN "orders" "o" ON "o"."sender" = "a"."id" 
    WHERE "o"."pickupFrom" = ${pickupPoint}
  `.then((res) => res.rows);
}

export async function getRevenueByPickupPoint(pickupPoint: number, dateRange?: [Date] | [Date, Date]) {
  if (dateRange) {
    let [start, end] = dateRange;
    if (!end) end = new Date();
    return sql`
      SELECT SUM("charge") FROM "orders"
      WHERE "pickupFrom" = ${pickupPoint} AND "status" = 'delivered' 
      AND "sendDate" >= ${start.toISOString()} 
      AND "sendDate" <= ${end.toISOString()}
    `.then((res) => res.rows[0]);
  }
  return sql`
    SELECT SUM("charge") FROM "orders"
    WHERE "pickupFrom" = ${pickupPoint} AND "status" = 'delivered'
  `.then((res) => res.rows[0]);
}