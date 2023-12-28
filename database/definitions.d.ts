type Account = {
  id: number;
  email: string;
  name: string;
  password: string;
  phone: string;
  role: "staff" | "manager" | "shipper" | "customer";
  status: "active" | "inactive";
  pickupPoint: number | null;
  transitHub: number | null;
};

type Order = { 
  id: number;
  weight: number;
  sender: number;
  receiverNumber: string;
  receiverAddress: string;
  pickupFrom: number;
  pickupTo: number;
  package: number | null;
  charge: number;
  sendDate: Date;
  arrivalDate: Date | null;
  shipper: number | null;
  status: "pending" | "delivering" | "delivered" | "cancelled";
};

type Package = {
  id: number;
  quantity: number;
  weight: number;
  pickupFrom: number;
  pickupTo: number;
  transitDate: Date | null;
  arrivalDate: Date | null;
  shipper: number | null;
  status: "pending" | "delivering1" | "delivering2" | "delivering3" | "delivered";
};

type PickupPoint = {
  id: number;
  name: string;
  location: string;
  hub: number;
};

type TransitHub = {
  id: number;
  name: string;
  location: string;
};




type CustomerData = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

type AccountData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "manager" | "staff";
  pickupPoint: number;
  transitHub: null;
} | {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "manager" | "staff";
  pickupPoint: null;
  transitHub: number;
} | {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "shipper";
  pickupPoint: null;
  transitHub: null;
} | {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "customer";
  pickupPoint?: null;
  transitHub?: null;
};

type OrderData = {
  sender: number;
  weight: number;
  receiverNumber: string;
  receiverAddress: string;
  pickupFrom: number;
  pickupTo: number;
  sendDate: Date;
  charge: number;
  shipper?: number | null;
  arrivalDate?: Date | null;
  status?: "pending" | "delivering" | "delivered" | "cancelled";
};

type PackageData = {
  pickupFrom: number;
  pickupTo: number;
  shipper: number | null;
  transitDate?: Date | null;
  arrivalDate?: Date | null;
  status?: "pending" | "delivering1" | "delivering2" | "delivering3" | "delivered";
}

type TransitHubData = {
  name: string;
  location: string;
};

type PickupPointData = {
  name: string;
  location: string;
  hub: number;
};