class DFSNode:
    def __init__(self, _id, snapshot):
        self.id = str(_id)
        self.snapshot = snapshot
        self.transitions = {}
        self.must_finish = None
        self.rewards = {}

    def __key(self):
        return self.id

    def __hash__(self):
        return hash(self.__key())

    def __eq__(self, other):
        return isinstance(other, DFSNode) and self.__key() == other.__key()

