interface QueryParameters {
  [key: string]: string | number | boolean;
}

export const toQueryString = (queryParameters: QueryParameters) => {
  const params = new URLSearchParams();

  for (const key in queryParameters) {
    if (queryParameters.hasOwnProperty(key)) {
      params.append(key, String(queryParameters[key]));
    }
  }

  return params.toString();
};
