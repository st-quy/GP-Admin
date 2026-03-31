import { SubmitSuccess } from "@assets/images";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const ResetPasswordSuccessfullyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center max-w-[824px] w-full px-4 mx-auto">
        <img
          src={SubmitSuccess}
          alt="Reset Password Successfully"
          className="w-full max-w-[500px] h-auto object-contain mx-auto mb-8"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
          Reset password successfully.
        </h1>
        <p className="text-base text-gray-500 mb-8">
          Your password has been successfully reset. Please log in again.
        </p>
        <div className="flex justify-center">
          <Button
            type="primary"
            size="large"
            className="!w-[250px] !h-[50px] text-base font-medium !bg-[#003087] hover:!bg-[#003087]/90 rounded-full"
            onClick={() => navigate("/login")}
          >
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSuccessfullyPage;
