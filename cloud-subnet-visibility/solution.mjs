export function subnetKind(hasRouteToInternetGateway) {
  return hasRouteToInternetGateway ? "public" : "private";
}
