from py4j.java_gateway import JavaGateway
import sys

gateway = JavaGateway.launch_gateway(classpath="/Users/tomyaacov/university/BPjsPythonWrapper/BPjs-0.12.2.uber.jar",
                                     die_on_exit=True,
                                     redirect_stdout=sys.stdout)

with open("hello_world.js", "r") as f:
    bprog = gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StringBProgram("my_bprogram", f.read())

runner = gateway.jvm.il.ac.bgu.cs.bp.bpjs.execution.BProgramRunner(bprog)
runner.addListener(gateway.jvm.il.ac.bgu.cs.bp.bpjs.execution.listeners.PrintBProgramRunnerListener())
runner.run()

