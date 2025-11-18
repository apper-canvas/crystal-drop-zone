import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* 404 Visual */}
        <div className="space-y-6">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">404</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-secondary bg-clip-text text-transparent">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sorry, we couldn't find the page you're looking for. The page might have been moved or doesn't exist.
            </p>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="primary"
            size="lg"
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Home" className="w-5 h-5" />
            <span>Go Home</span>
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            size="lg"
            className="flex items-center space-x-2"
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            <span>Go Back</span>
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center pt-8">
          <p className="text-sm text-gray-500">
            Need help? The Drop Zone file uploader is available on the home page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;