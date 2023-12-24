type Customer = {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string;
};

type Employee = {
  id: number;
  email: string;
  name: string;
  password: string;
  phone: string;
  role: "staff" | "manager" | "shipper" | "retired";
  status: "active" | "inactive";
  pickupPointId: number | null;
  transitHubId: number | null;
};

type Order = { 
  id: number;
  weight: number;
  senderId: number;
  receiverNumber: string;
  receiverAddress: string;
  pickupFrom: number;
  pickupTo: number;
  packageId: number | null;
  sendDate: string;
  arrivalDate: string | null;
  status: "pending" | "delivering" | "delivered" | "cancelled";
};

type Package = {
  id: number;
  quantity: number;
  weight: number;
  pickupFrom: number;
  pickupTo: number;
  transitDate: string | null;
  arrivalDate: string | null;
  shipperId: number | null;
  status: "pending" | "delivering1" | "delivering2" | "delivering3" | "delivered";
};

type PickupPoint = {
  id: number;
  name: string;
  location: string;
  hubId: number;
};

type TransitHub = {
  id: number;
  name: string;
  location: string;
};


