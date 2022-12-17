module.exports = ({context}) => {
    for (const label of context.payload.pull_request.labels) {
        if (label.name === 'do not merge') {
            throw new Error('「do not merge」ラベルが付与されているためマージできません。');
        }
    }
}
