export default (docs) => {
  try {
    const editedDocs = docs.map((doc) => {
      doc = {...doc};

      for (const key in doc) {
        if (doc[key] instanceof Array) {
          doc[key] = doc[key][0];
        }
      }

      return doc;
    });

    return editedDocs;
  } catch (e) {
    console.error(e);
  }
};
