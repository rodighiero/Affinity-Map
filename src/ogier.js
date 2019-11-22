/**

* Apply transformation to node values (normalize, max, split scholar names, ...)

*/

const postProcessNodes = (affAcronyms, nodes) => {

    const nullAffinitiesObj = affAcronyms.reduce((o, v) => ({ ...o, [v]: 0 }), {})
    const averageLab = nodes.reduce((lab, node) => {
        affAcronyms.forEach(affinity => lab[affinity] += node.metrics.values[affinity] / nodes.length)
        return lab
    }, affAcronyms.reduce((o, v) => ({ ...o, [v]: 0 }), {}))

    // standardize metrics

    nodes.forEach(node => {
        node.metrics.std = {}
        affAcronyms.forEach(affinity =>
            node.metrics.std[affinity] =
            node.metrics.values[affinity] ?
                node.metrics.values[affinity] /
                averageLab[affinity] : 0)
    })

    // Find scholars picks

    nodes.forEach(lab => {
        lab.metrics.max = lab.network.nodes.reduce((o, node) => {
            affAcronyms.forEach(k =>
                o[k] = o[k] >
                    node.metrics.values[k] ?
                    o[k] :
                    node.metrics.values[k]
            )
            return o
        }, { ...nullAffinitiesObj })
    })
}