declare interface RootState {
  auth: {
    user: {
      firstName?: string;
      lastName?: string;
      dob?: string;
      teacherCode?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  };
}