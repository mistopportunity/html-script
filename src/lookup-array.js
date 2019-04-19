function lookupArray() {
    this.array = [];
    this.list = {};
    this.push = item => {
        this.array.push(item);
        processAddedItem(item);
        return item;
    }
    this.unshift = item => {
        this.array.unshift(item);
        processAddedItem(item);
        return item;
    }
    function processAddedItem(item) {
        if(this.list[item]) {
            this.list.count++;
        } else {
            this.list[item] = {
                count: 1,
            }
        }
        return item;
    }
    function processRemovedItem(item) {
        this.list[item].count--;
        if(this.list[item].count < 1) {
            delete this.list[item];
        }
        return item;
    }

    function genericSingleDeletion(operationType) {
        if(this.array.length > 0) {
            const removed = this.array[operationType]();
            processRemovedItem(removed);
            return removed;
        } else {
            throw Error(ARRAY_EMPTY_ERROR);
        }
    }

    this.pop = () => genericSingleDeletion("pop");
    this.shift = () => genericSingleDeletion("shift");

    this.insert = (item,index) => {
        this.array.splice(index,0,item);
        processAddedItem(item);
        return item;
    }
    this.delete = index => {
        if(index < 0) {
            throw Error(ARRAY_BOUNDS_ERROR);
        } else if(index >= this.array.length) {
            throw Error(ARRAY_BOUNDS_ERROR)
        } else {
            const removed = this.array.splice(index,1)[0];
            processRemovedItem(removed);
            return removed;
        }
    }
    this.get = index => {
        if(index < 0) {
            throw Error(ARRAY_BOUNDS_ERROR);
        } else if(index >= this.array.length) {
            throw Error(ARRAY_BOUNDS_ERROR)
        } else {
            return this.array[index];
        }
    }
    this.size = () => this.array.length;
    this.contains = value => this.list[value] ? true : false;
    this.countOf = value => {
        const lookup = this.list[value];
        if(lookup) {
            return lookup.count;
        } else {
            return 0;
        }
    }
}
