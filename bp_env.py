import gym
from py4j.java_gateway import JavaGateway
import sys
import os
from abc import abstractmethod


class BPEnv(gym.Env):
    def __init__(self, program_file_name, add_print_listener=False):
        self.gateway = None

        self.program_file_name = program_file_name
        self.add_print_listener = add_print_listener

        self.bprogram = None
        self.exSvc = None
        self.listeners = None
        self.event_selection = None
        self.storage_modification_strategy = None

        self.last_snapshot = None
        self.current_snapshot = None

    def step(self, action):
        self.last_snapshot = self.current_snapshot
        self.current_snapshot = self.last_snapshot.triggerEvent(action, self.exSvc, self.listeners,
                                                             self.storage_modification_strategy)
        selectable_events = self.event_selection.selectableEvents(self.current_snapshot)
        selectable_events = self.gateway.jvm.java.util.ArrayList(selectable_events)
        sync_statements = self.gateway.jvm.java.util.ArrayList(self.current_snapshot.getStatements())
        sync_statements = "_".join(sorted([x.toString() for x in sync_statements]))
        return self.last_snapshot, self.reward(), len(selectable_events) == 0, {"selectable_events": selectable_events, "sync_statement": sync_statements}

    def reset(self, **kwargs):
        dir_path = os.path.dirname(os.path.realpath(__file__))

        self.gateway = JavaGateway.launch_gateway(classpath=os.path.join(dir_path, "BPjs-0.12.2.uber.jar"),
                                                  die_on_exit=True,
                                                  redirect_stdout=sys.stdout)

        with open(self.program_file_name, "r") as f:
            self.bprogram = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StringBProgram("env_bprogram", f.read())

        self.exSvc = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.internal.ExecutorServiceMaker().makeWithName("1")
        self.listeners = self.gateway.jvm.java.util.ArrayList()
        if self.add_print_listener:
            self.listeners.add(self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.execution.listeners.PrintBProgramRunnerListener())
        self.event_selection = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.eventselection.SimpleEventSelectionStrategy()
        self.storage_modification_strategy = self.gateway.jvm.il.ac.bgu.cs.bp.bpjs.model.StorageModificationStrategy.PASSTHROUGH

        self.current_snapshot = self.bprogram.setup().start(self.exSvc, self.storage_modification_strategy)
        selectable_events = self.event_selection.selectableEvents(self.current_snapshot)
        selectable_events = self.gateway.jvm.java.util.ArrayList(selectable_events)
        sync_statements = self.gateway.jvm.java.util.ArrayList(self.current_snapshot.getStatements())
        sync_statements = "_".join(sorted([x.toString() for x in sync_statements]))
        return self.current_snapshot, {"selectable_events": selectable_events, "sync_statement": sync_statements}

    def close(self):
        if self.gateway:
            self.gateway.close()
        super(BPEnv, self).close()

    @abstractmethod
    def render(self, mode="human"):
        raise NotImplementedError()

    @abstractmethod
    def reward(self):
        return None

