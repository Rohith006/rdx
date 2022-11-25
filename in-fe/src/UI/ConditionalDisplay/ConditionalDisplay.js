import { getRoles } from "../../components/authentication/login";

function ConditionalDisplay({ children, roles }) {
  const userRole = getRoles();
  const showPermission = (roles) => {
    const permission = userRole.every((role) => {
      return roles?.includes(role);
    });
    return permission;
  };

  return showPermission(roles) && children ? children : null;
}

export default ConditionalDisplay;
