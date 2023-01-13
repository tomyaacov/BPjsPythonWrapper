from dfs_node import DFSNode
import graphviz

class DFSBProgram:
    def __init__(self, gateway, bprogram):
        self.gateway = gateway
        self.bprogram = bprogram
        self.id_counter = 0

    def run(self):
        exSvc = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.internal.ExecutorServiceMaker().makeWithName("1")
        listeners = self.gateway.jvm.java.util.ArrayList()
        event_selection = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.eventselection.SimpleEventSelectionStrategy()
        storage_modification_strategy = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StorageModificationStrategy.PASSTHROUGH

        snapshot = self.bprogram.setup().start(exSvc, storage_modification_strategy)
        a = [x.getData() for x in snapshot.getStatements()]
        init_s = DFSNode(self.id_counter, snapshot, snapshot.hashCode())
        self.id_counter += 1
        init_s.must_finish = [False for x in snapshot.getBThreadSnapshots()] # initial must finish must be false
        visited = {}
        # Create a stack for DFS
        stack = []
        # Push the current source node.
        stack.append(init_s)

        while (len(stack)):
            # Pop a vertex from stack
            s = stack.pop()

            # Stack may contain same vertex twice. So
            # we need to print the popped item only
            # if it is not visited.
            if not visited.get(s):
                #print(s.id)
                visited[s] = s.id

            # Get all adjacent vertices of the popped vertex s
            # If a adjacent has not been visited, then push it
            # to the stack.
            events = self.gateway.jvm.java.util.ArrayList(event_selection.selectableEvents(s.snapshot))
            for event in events:
                next_snapshot = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.bprogramio.BProgramSyncSnapshotCloner.clone(s.snapshot).triggerEvent(event, exSvc, listeners, storage_modification_strategy)
                #next_snapshot = s.snapshot.triggerEvent(event, exSvc, listeners, storage_modification_strategy)
                optional_new_s = DFSNode(self.id_counter, next_snapshot, next_snapshot.hashCode())
                if optional_new_s in visited:
                    new_s = DFSNode(visited[optional_new_s], next_snapshot, next_snapshot.hashCode())
                else:
                    new_s = optional_new_s
                new_s.must_finish = [bts.getSyncStatement().isHot() for bts in snapshot.getBThreadSnapshots()]
                s.transitions[event.getName()] = new_s
                s.rewards[event.getName()] = DFSBProgram.reward(s, new_s)
                if not visited.get(new_s):
                    stack.append(new_s)
        return init_s, visited.keys()

    @staticmethod
    def save_graph(init, states, name):
        g = graphviz.Digraph()
        for s in states:
            g.node(s.id, shape='doublecircle' if s == init else 'circle')
        for s in states:
            for e, s_new in s.transitions.items():
                g.edge(s.id, s_new.id, label=e)
        g.save(name)

    @staticmethod
    def reward(s1, s2):
        reward = 0
        for j in range(len(s1.must_finish)):
            if s1.must_finish[j] and not s2.must_finish[j]:
                reward += 1
            if not s1.must_finish[j] and s2.must_finish[j]:
                reward -= 1
        # if reward == 0 and any(new_hot_states):
        #     reward = -0.001
        return reward


