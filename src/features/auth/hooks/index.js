import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthApi } from '../api';
import { message } from 'antd';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@shared/lib/constants/auth';
import { useNavigate } from 'react-router-dom';
import { login, logout, updateUser } from '@app/providers/reducer/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setStorageData } from '@shared/lib/storage';
import { jwtDecode } from 'jwt-decode';
import {
  clearAuthState,
  normalizeEmail,
} from '@shared/lib/auth/clearAuthState';

export const useFetchProfile = (studentId) => {
  return useQuery({
    queryKey: ['profileDetail'],
    queryFn: async () => {
      const { data } = await AuthApi.getProfile(studentId);
      return data;
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const normalizedCredentials = {
        ...credentials,
        email: normalizeEmail(credentials.email),
      };

      const { data } = await AuthApi.login(normalizedCredentials);
      const accessToken = data?.data?.access_token;
      const refreshToken = data?.data?.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error('Login response is missing authentication tokens.');
      }

      const decoded = jwtDecode(accessToken);
      const roles = Array.isArray(decoded?.roles) ? decoded.roles : [];

      // Save fresh auth state before any redirect so protected routes use the latest token.
      setStorageData(ACCESS_TOKEN, accessToken);
      setStorageData(REFRESH_TOKEN, refreshToken);
      queryClient.removeQueries({ queryKey: ['profile'] });
      dispatch(login());

      if (roles.includes('student')) {
        navigate('/unauthorized', { replace: true });
        return data.data;
      }

      if (roles.includes('teacher')) {
        navigate('/class', { replace: true });
        return data.data;
      }

      if (roles.includes('admin')) {
        navigate('/dashboard', { replace: true });
      }

      return data.data;
    },

    onError(error) {
      const msg =
        error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      message.error(msg);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (params) => {
      const { data } = await AuthApi.register(params);
      navigate('/login');
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
      return data;
    },
    onSuccess: (data) => {
      message.success(
        data?.message || 'Password reset link sent to your email'
      );
      navigate('/login');
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
      navigate('/reset-success');
      return data.data;
    },
    onError({ response }) {
      message.error(response.data.message);
      navigate('/reset-password');
    },
  });
};

export const useGetProfile = () => {
  const { userId } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      try {
        const data = await AuthApi.getProfile(userId);

        dispatch(
          updateUser({
            userId: data.data.ID,
            role: data.data.roles,
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
          message.error('Your account has been blocked');
          clearAuthState();
          dispatch(logout());
          window.location.href = `${window.location.origin}/unauthorized`;
        }

        return data.data;
      } catch (error) {
        message.error(
          error.response?.data?.message || 'Failed to fetch profile'
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
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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

export const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return () => {
    clearAuthState();
    queryClient.clear();
    dispatch(logout());
    navigate('/login', { replace: true });
  };
};
