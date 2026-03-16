export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface Admin {
  id: string;
  email: string;
  username: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  address: string;
}

export interface FlowerResponse {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = "http://127.0.0.1:8000";

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/admin/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const newTokens: Token = await refreshRes.json();
          localStorage.setItem("access_token", newTokens.access_token);
          localStorage.setItem("refresh_token", newTokens.refresh_token);
          return request<T>(path, options, false);
        }
      } catch {
        // refresh failed
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new Event("auth:logout"));
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) {
        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  login(email: string, password: string): Promise<Token> {
    return request<Token>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

export const adminsApi = {
  list(): Promise<Admin[]> {
    return request<Admin[]>("/admins/");
  },

  get(id: string): Promise<Admin> {
    return request<Admin>(`/admins/${id}`);
  },

  create(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<Admin> {
    return request<Admin>("/admins/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: { email: string; username: string; password: string },
  ): Promise<Admin> {
    return request<Admin>(`/admins/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<Admin> {
    return request<Admin>(`/admins/${id}`, { method: "DELETE" });
  },
};

export const usersApi = {
  list(): Promise<User[]> {
    return request<User[]>("/users/");
  },

  get(id: string): Promise<User> {
    return request<User>(`/users/${id}`);
  },

  create(data: {
    email: string;
    username: string;
    password: string;
    address: string;
  }): Promise<User> {
    return request<User>("/users/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: { email: string; username: string; password: string; address: string },
  ): Promise<User> {
    return request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<User> {
    return request<User>(`/users/${id}`, { method: "DELETE" });
  },
};

export interface OrderItemResponse {
  id: string;
  flower_id: string;
  quantity: number;
  price_at_purchase: number;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  created_at: string;
  items: OrderItemResponse[];
}

export const ordersApi = {
  list(): Promise<OrderResponse[]> {
    return request<OrderResponse[]>("/orders/admin/all");
  },

  get(id: string): Promise<OrderResponse> {
    return request<OrderResponse>(`/orders/${id}`);
  },
};

export const flowersApi = {
  list(): Promise<FlowerResponse[]> {
    return request<FlowerResponse[]>("/flowers/");
  },

  create(data: {
    name: string;
    price: number;
    quantity: number;
  }): Promise<FlowerResponse> {
    return request<FlowerResponse>("/flowers/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  get(id: string): Promise<FlowerResponse> {
    return request<FlowerResponse>(`/flowers/${id}`);
  },

  update(
    id: string,
    data: { name?: string; price?: number; quantity?: number },
  ): Promise<FlowerResponse> {
    return request<FlowerResponse>(`/flowers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return request<void>(`/flowers/${id}`, { method: "DELETE" });
  },
};
