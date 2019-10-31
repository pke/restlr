# An Electric Kettle Resource

States: idle, heating

Events:

| Name       | Description |
| ---------- | ----------- |
| start      | Heating has started |
| heating    | Heating with current temperature in °C and K` |
| disconnect | Kettle was disconnected from plate: action to put back on plate
| done       | Reached target temperature |

idle => heating
  only when: lid closed, placed on connector

## State: Idle

### Actions

#### Lid open?

1. Close lid

1. 
