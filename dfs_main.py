from py4j.java_gateway import JavaGateway
import sys
import os
from dfs_bprogram import DFSBProgram

dir_path = os.path.dirname(os.path.realpath(__file__))

gateway = JavaGateway.launch_gateway(classpath=os.path.join(dir_path, "BPjs-0.12.3.uber.jar"),
                                     die_on_exit=True,
                                     redirect_stdout=sys.stdout)

with open("sokoban_2.js", "r") as f:
    bprog = gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StringBProgram("my_bprogram", f.read())

dfs = DFSBProgram(gateway, bprog)
import time
tic = time.perf_counter()
init, states = dfs.run()
toc = time.perf_counter()
print(toc - tic)
DFSBProgram.save_graph(init, states, "graph.dot")
print("dfs_time:", toc - tic)
print("graph size:", len(states))
print("graph edges:", sum([len(s.transitions) for s in states]))
import pickle
import sys
sys.setrecursionlimit(10000)

def save_obj(obj, file_name):
    with open(file_name, 'wb') as f:
        pickle.dump(obj, f)


# with open("/Users/tomyaacov/Downloads/states_bppy", 'rb') as f:
#     states_bppy = pickle.load(f)

d = {}
for s in states:
    d[s.id[1:]] = {}
    for k,v in s.transitions.items():
        if k != "Data":
            d[s.id[1:]][k] = v.id[1:]
states_bpjs = d
print("graph size:", len(states_bpjs))
print("graph edges:", sum([len(states_bpjs[s]) for s in states_bpjs]))
# print(set(states_bpjs.keys()) == set(states_bppy.keys()))
# for k in states_bpjs:
#     if states_bppy[k] != states_bpjs[k]:
#         print(k)
#         print("states_bppy", states_bppy[k])
#         print("states_bpjs", states_bpjs[k])
