const offersFetcher = async (url) => {
  const response = await fetch(`${api}/${url}`);
  const data = await response.json();
  return data;
};
export default offersFetcher;
