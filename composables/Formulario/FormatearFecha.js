export const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toISOString().split('T')[0];
    // o: return new Date(dateString).toLocaleDateString();
};