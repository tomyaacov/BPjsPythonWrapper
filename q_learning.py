from liveness_bp_env import LivenessBPEnv
import random
import numpy as np

env = LivenessBPEnv("a_and_b.js")
qtable = {}

episodes = 1000            # Total episodes
max_steps = 1000            # Max steps per episode
lr = 0.3                    # Learning rate
decay_fac = 0.001         # Decay learning rate each iteration
gamma = 0.99                # Discounting rate - later rewards impact less

for episode in range(episodes):
    state, info = env.reset()  # Reset the environment
    if state not in qtable:
        qtable[info.get("sync_statement")] = dict([(e, 0) for e in info.get("selectable_events")])
    done = False  # Are we done with the environment
    lr -= decay_fac  # Decaying learning rate
    step = 0
    if lr <= 0:  # Nothing more to learn?
        break
    for step in range(max_steps):
        action = random.choice(info.get("selectable_events"))  # Randomly Choose an Action
        new_state, reward, done, new_info = env.step(action)  # Take the action -> observe new state and reward
        # Update qtable values
        if new_info.get("sync_statement") not in qtable:
            qtable[new_info.get("sync_statement")] = dict([(e, 0) for e in new_info.get("selectable_events")])
        if done:  # If last, do not count future accumulated reward
            qtable[info.get("sync_statement")][action] = qtable[info.get("sync_statement")][action] + lr * (reward + gamma * 0 - qtable[info.get("sync_statement")][action])
            break
        else:  # Consider accumulated reward of best decision stream
            qtable[info.get("sync_statement")][action] = qtable[info.get("sync_statement")][action] + lr * (
                        reward + gamma * np.max(list(qtable[new_info.get("sync_statement")].values())) - qtable[info.get("sync_statement")][action])

        # moving states
        state = new_state
        info = new_info

    if episode % 10 == 0:
        print('episode = ', episode)
        print('learning rate = ', lr)
        print('-----------')


env = LivenessBPEnv("a_and_b.js")
cumulative_reward = []
for episode in range(episodes):
    state, info = env.reset()  # Reset the environment
    done = False  # Are we done with the environment
    cumulative_reward.append(0)
    while not done:
        # action = max(qtable[info.get("sync_statement")], key=qtable[info.get("sync_statement")].get)
        # action = [x for x in info.get("selectable_events") if x.toString() == action.toString()][0]
        action = random.choice(info.get("selectable_events"))  # Randomly Choose an Action
        new_state, reward, done, new_info = env.step(action)  # Take the action -> observe new state and reward
        cumulative_reward[-1] += reward
        # moving states
        state = new_state
        info = new_info

print("mean reward:", sum(cumulative_reward)/len(cumulative_reward))
