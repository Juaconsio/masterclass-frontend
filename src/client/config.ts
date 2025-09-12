import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;
  private isDev = import.meta.env.DEV;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.PUBLIC_BACKEND_API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private logRequest(config: AxiosRequestConfig) {
    if (!this.isDev) return;

    console.groupCollapsed(
      `%c[HTTP] ${config.method?.toUpperCase()} ${config.url}`,
      'color: #2196F3; font-weight: bold;'
    );
    console.log('Headers:', config.headers);
    if (config.data) console.log('Body:', config.data);
    if (config.params) console.log('Params:', config.params);
    console.groupEnd();
  }

  private logResponse(response: AxiosResponse) {
    if (!this.isDev) return;

    console.groupCollapsed(
      `%c[HTTP ✅] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`,
      'color: #4CAF50; font-weight: bold;'
    );
    console.log('Data:', response.data);
    console.groupEnd();
  }

  private logError(error: any) {
    if (!this.isDev) return;

    console.groupCollapsed(
      `%c[HTTP ❌] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      'color: #F44336; font-weight: bold;'
    );
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.groupEnd();
  }

  private setupInterceptors() {
    // this.axiosInstance.interceptors.request.use(
    //   (config) => {
    //     const token = localStorage.getItem('token');
    //     if (token) config.headers.Authorization = `Bearer ${token}`;
    //     this.logRequest(config);
    //     return config;
    //   },
    //   (error) => {
    //     this.logError(error);
    //     return Promise.reject(error);
    //   }
    // );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logResponse(response);
        return response;
      },
      (error) => {
        this.logError(error);
        if (error.response?.status === 401) {
          // manejar logout/redirección
          console.log('Re direction to auth not implement');
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export const httpClient = HttpClient.getInstance();
