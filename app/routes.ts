import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("flowers", "routes/flowers.tsx"),
    route("admins", "routes/admins.tsx"),
    route("customers", "routes/customers.tsx"),
    route("orders", "routes/orders.tsx"),
  ]),
] satisfies RouteConfig;
