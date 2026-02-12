export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const roleLabels = {
  IGL: 'In-Game Leader',
  Assaulter: 'Assaulter',
  Support: 'Support',
  Sniper: 'Sniper'
};
