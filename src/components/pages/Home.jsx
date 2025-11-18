import FileUploader from "@/components/organisms/FileUploader";
import { useSelector } from 'react-redux';

function Home() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  return <FileUploader />;
};

export default Home;