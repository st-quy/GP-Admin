import { SubmitSuccess } from "@assets/images";
import { useNavigate } from "react-router-dom";

const ResetPasswordSuccessfullyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center bg-[#F9F9F9]">
      <div className="text-center max-w-[824px] w-full px-4 mx-auto">
        <img
          src={SubmitSuccess}
          alt="Reset Password Successfully"
          className="w-full max-w-[824px] h-[516px] object-contain mx-auto mb-6 sm:mb-8"
        />
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Reset password successfully.
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Your password has been successfully reset. Please log in again.
        </p>
        <div className="flex justify-center">
          <button
            className="reset-password-button w-[250px] h-[50px] rounded-[50px] bg-primaryColor text-white hover:bg-[#002A6B] transition-colors text-sm sm:text-base outline-none focus:outline-none border-none"
            onClick={() => navigate("/login")}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSuccessfullyPage;
