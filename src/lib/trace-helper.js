function flattenChild(root) {
  let children = [];
  function recursive(child) {
    child.map((c, i) => {
      let x = {};

      if (!c.depth && !(c.depth === 0)) {
        x.depth = 0;
      } else {
        x.depth = c.depth + 1;
      }

      x.index = i;
      x.fieldName = c.fieldName;
      x.type = c.type;
      x.startTime = c.startTime.toString();
      x.endTime = c.endTime.toString();

      children.push(x);

      if (c.child) {
        c.child.map(sc => {
          sc.child.forEach(sc => {
            sc.depth = x.depth
          });
          recursive(sc.child)
        })
      }
    });
  }

  recursive(root.child);
  return children;
}

module.exports = {
  flattenChild
};