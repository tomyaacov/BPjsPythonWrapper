class DFSNode:
    def __init__(self, _id, snapshot, hashcode):
        self.id = str(_id)
        self.snapshot = snapshot
        self.hashcode = hashcode
        self.transitions = {}
        self.must_finish = None
        self.rewards = {}
        #self.id_dict = self.get_id_dict()
        #self.id = "_".join(["_".join([str(x) for x in self.id_dict[d].values()]) for d in sorted(self.id_dict.keys())])
        # self.id = str(int(self.id_dict["player"]["i"])) + "_" + str(int(self.id_dict["player"]["j"])) + "_D_" + \
        #           str(int(self.id_dict["box0"]["i"])) + "_" + str(int(self.id_dict["box0"]["j"]))+ "_" + \
        #           str(int(self.id_dict["box1"]["i"])) + "_" + str(int(self.id_dict["box1"]["j"]))# debug
        l1 = self.snapshot.getBThreadSnapshots().toArray()
        for i in range(len(l1)):
            if l1[i].getName() == "data":
                self.id = str(dict(l1[i].getData())["str"])

    def get_id_dict(self):
        l1 = self.snapshot.getBThreadSnapshots().toArray()
        d1 = {}
        for i in range(len(l1)):
            a = l1[i].getData()
            d1[l1[i].getName()] = dict(a) if a else {}
        return d1

    # def __key(self):
    #     return self.hashcode

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        return other.id == self.id
        #return isinstance(other, DFSNode) and self.__key() == other.__key() and self.snapshot.equals(other.snapshot)

