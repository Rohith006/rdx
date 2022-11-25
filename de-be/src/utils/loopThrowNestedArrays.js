export default function(maxIndices, func) {
  doCallManyTimes(maxIndices, func, [], 0);
}

function doCallManyTimes(maxIndices, func, args, index) {
  if (maxIndices.length == 0) {
    func(args);
  } else {
    const rest = maxIndices.slice(1);
    for (args[index] = 0; args[index] < maxIndices[0]; ++args[index]) {
      doCallManyTimes(rest, func, args, index + 1);
    }
  }
}

// export default (lengths, fn) => {
//     let n = lengths.length;
//
//     let indices = [];
//     for (let i = n; --i >= 0;) {
//         if (lengths[i] === 0) { return; }
//         if (lengths[i] !== (lengths[i] & 0x7ffffffff)) { throw new Error(); }
//         indices[i] = 0;
//     }
//
//     while (true) {
//         fn.apply(null, indices);
//         // Increment indices.
//         ++indices[n - 1];
//         for (let j = n; --j >= 0 && indices[j] === lengths[j];) {
//             if (j === 0) { return; }
//             indices[j] = 0;
//             ++indices[j - 1];
//         }
//     }
// }
