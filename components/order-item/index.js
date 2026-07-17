Component({ properties: { order: { type: Object, value: {} } }, methods: { act(event){ this.triggerEvent('action',{action:event.currentTarget.dataset.action,id:this.data.order.id}) } } })
