
export const getStatusColor = (status: string, paymentStatus?: string): string => {
  if (status === 'approved') {
    if (paymentStatus === 'awaiting_payment') return 'bg-blue-100 text-blue-800';
    if (paymentStatus === 'paid') return 'bg-purple-100 text-purple-800';
  }
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRequestStatusText = (status: string, paymentStatus?: string): string => {
  const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
  if (status === 'approved') {
    if (paymentStatus === 'awaiting_payment') return 'Approved - Awaiting Payment';
    if (paymentStatus === 'paid') return 'Paid & Rescheduled';
    return 'Approved';
  }
  return capitalizedStatus;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};
