export const getCheckpoints = async () => {
  try {
    const response = await fetch("https://672fc91b66e42ceaf15eb4cc.mockapi.io/Checkpoint");
    if (!response.ok) {
      throw new Error("Failed to fetch checkpoint data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching checkpoints:", error);
    return [];
  }
};
