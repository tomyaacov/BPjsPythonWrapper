from bp_env import BPEnv
import random


class LivenessBPEnv(BPEnv):

    def render(self, mode="human"):
        pass

    def reward(self):
        if self.last_snapshot.isHot() == self.current_snapshot.isHot():
            return 0
        else:
            return int(self.last_snapshot.isHot()) * 2 - 1


if __name__ == "__main__":
    env = LivenessBPEnv("a_and_b.js", add_print_listener=True)
    for i in range(5):
        observation, info = env.reset()
        done = False
        while not done:
            possible_actions = info.get("selectable_events")
            action = random.choice(possible_actions)
            observation, reward, done, info = env.step(action)
        env.close()
