import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "../api"; // You'll need to create this
import { message } from "antd";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@shared/lib/constants/auth";
import { useNavigate } from "react-router-dom";
import { login, updateUser } from "@app/providers/reducer/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { setStorageData } from "@shared/lib/storage";
import { jwtDecode } from "jwt-decode";

export const useFetchProfile = (studentId) => {
  return useQuery({
    queryKey: ["profileDetail"],
    queryFn: async () => {
      const { data } = await AuthApi.getProfile(studentId);
      return data;
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await AuthApi.login(credentials);
      const decodedToken = jwtDecode(data.data.access_token);

      // Set token and dispatch login BEFORE navigation
      setStorageData(ACCESS_TOKEN, data.data.access_token);
      setStorageData(REFRESH_TOKEN, data.data.refresh_token);
      dispatch(login());

      // Navigate AFTER setting auth state
      if (decodedToken?.role.includes("student")) {
        navigate("/unauthorized");
      } else if (decodedToken?.role.includes("teacher")) {
        navigate("/class");
      } else if (decodedToken?.role.includes("admin")) {
        navigate("/dashboard");
      }

      return data.data;
    },
    onError(error) {
      let errorMessage = "Login failed. Please try again.";
      
      // Handle network errors specifically
      if (!error?.response) {
        if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error")) {
          errorMessage = "Cannot connect to server. Please check if the backend API is running.";
        } else if (error?.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection.";
        } else {
          errorMessage = "Network error. Please check if the backend API is running.";
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (params) => {
      const { data } = await AuthApi.register(params);
      navigate("/login");
      message.success(data.message);
      return data.data;
    },
    onError({ response }) {
      message.error(response.data.message);
    },
  });
};

export const useForgotPassword = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (params) => {
      const { data } = await AuthApi.forgotPassword(params);
      return data.data;
    },
    onError({ response }) {
      message.error(response.data.message);
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (params) => {
      const { data } = await AuthApi.resetPassword(params);
      message.success(data.message);
      navigate("/reset-success");
      return data.data;
    },
    onError({ response }) {
      message.error(response.data.message);
      navigate("/reset-password");
    },
  });
};

export const useGetProfile = () => {
  const { userId } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      try {
        const data = await AuthApi.getProfile(userId);        
        dispatch(
          updateUser({
            userId: data.data.ID,
            role: data.data.roleIDs,
            lastName: data.data.lastName,
            firstName: data.data.firstName,
            email: data.data.email,
            phone: data.data.phone,
            class: data.data.class,
            studentCode: data.data.studentCode,
            teacherCode: data.data.teacherCode,
            address: data.data.address,
            dob: data.data.dob,
          })
        );
        if (!data.data.status) {
          message.error("Your account has been blocked");
          localStorage.clear();
          window.location.href = `${window.location.origin}/unauthorized`;
        }

        return data.data;
      } catch (error) {
        message.error(
          error.response?.data?.message || "Failed to fetch profile"
        );
        return null;
      }
    },
    enabled: Boolean(userId),
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const { userId } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (params) => {
      const { data } = await AuthApi.updateProfile(userId, params);
      dispatch(
        updateUser({
          userId: data.data.ID,
          role: data.data.roleIDs,
          lastName: data.data.lastName,
          firstName: data.data.firstName,
          email: data.data.email,
          phone: data.data.phone,
          class: data.data.class,
          address: data.data.address,
          studentCode: data.data.studentCode,
          teacherCode: data.data.teacherCode,
          bod: data.data.bod,
        })
      );
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      message.success(data.message);
      return data.data;
    },
    onError({ response }) {
      message.error(response.data.message);
    },
  });
};

export const useChangePassword = () => {
  const { userId } = useSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (params) => {
      const { data } = await AuthApi.changePassword(userId, params);
      message.success(data.message);
      return data.data;
    },
    onError({ response }) {
      message.error(response.data.message);
    },
  });
};
