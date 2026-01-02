from typing import List, Dict, Optional
import json
import os

class Neuron:
    def __init__(self, neuron_id: str, layer: str, label: str, activation: float = 0.0):
        self.id = neuron_id
        self.layer = layer  # 'input', 'hidden', 'output'
        self.label = label
        self.activation = activation
        self.fired = False

    def to_dict(self):
        return {
            "id": self.id,
            "layer": self.layer,
            "label": self.label,
            "activation": self.activation
        }

    @classmethod
    def from_dict(cls, data):
        return cls(data["id"], data["layer"], data["label"], data["activation"])

class Synapse:
    def __init__(self, source_id: str, target_id: str, weight: float = 0.1):
        self.source_id = source_id
        self.target_id = target_id
        self.weight = weight

    def to_dict(self):
        return {
            "source_id": self.source_id,
            "target_id": self.target_id,
            "weight": self.weight
        }

    @classmethod
    def from_dict(cls, data):
        return cls(data["source_id"], data["target_id"], data["weight"])
