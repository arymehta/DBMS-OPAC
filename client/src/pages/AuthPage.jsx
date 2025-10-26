import { useParams } from 'react-router-dom';
import CandidateLogin from '../components/CandidateLogin';
import CandidateSignup from '../components/CandidateSignup';
import AdminLogin from '../components/AdminLogin';

const AuthPage = () => {
  const { type } = useParams();

  const renderAuthComponent = () => {
    switch (type) {
      case 'candidate-login':
        return <CandidateLogin />;
      case 'candidate-signup':
        return <CandidateSignup />;
      case 'admin-login':
        return <AdminLogin />;
      default:
        return <CandidateLogin />;
    }
  };

  return renderAuthComponent();
};

export default AuthPage;