Component({ properties: { dataSource: { type: Object, value: {} }, maskValues: { type: Boolean, value: false } }, methods: { toggle(){ this.triggerEvent('toggle') } } })
