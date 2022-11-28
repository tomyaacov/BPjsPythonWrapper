from py4j.java_gateway import JavaGateway
import os
import sys

dir_path = os.path.dirname(os.path.realpath(__file__))

gateway = JavaGateway.launch_gateway(classpath=os.path.join(dir_path, "BPjs-0.12.2.uber.jar"),
                                     die_on_exit=True,
                                     redirect_stdout=sys.stdout)

with open("a_and_b.js", "r") as f:
    bprogram = gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StringBProgram("bprogram", f.read())

exSvc = gateway.jvm.il.ac.bgu.cs.bp.bpjs.internal.ExecutorServiceMaker().makeWithName("1")
listeners = gateway.jvm.java.util.ArrayList()
event_selection = gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.eventselection.SimpleEventSelectionStrategy()
storage_modification_strategy = gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StorageModificationStrategy.PASSTHROUGH

current_snapshot = bprogram.setup().start(exSvc, storage_modification_strategy)
print(current_snapshot.hashCode())
selectable_events = gateway.jvm.java.util.ArrayList(event_selection.selectableEvents(current_snapshot))
print(selectable_events[0])
next_snapshot = current_snapshot.triggerEvent(selectable_events[0], exSvc, listeners, storage_modification_strategy)
print(next_snapshot.hashCode())
gateway.close()
