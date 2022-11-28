from py4j.java_gateway import JavaGateway
import sys
import os
from dfs_bprogram import DFSBProgram

dir_path = os.path.dirname(os.path.realpath(__file__))

gateway = JavaGateway.launch_gateway(classpath=os.path.join(dir_path, "BPjs-0.12.3.uber.jar"),
                                     die_on_exit=True,
                                     redirect_stdout=sys.stdout)

with open("hot_cold.js", "r") as f:
    bprog = gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StringBProgram("my_bprogram", f.read())

dfs = DFSBProgram(gateway, bprog)
init, states = dfs.run()
DFSBProgram.save_graph(init, states, "graph.dot")