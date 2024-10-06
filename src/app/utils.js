function getNonOwnerRole(ownerRole) {
  return ownerRole === 1 ? 2 : 1;
}

export { getNonOwnerRole };
