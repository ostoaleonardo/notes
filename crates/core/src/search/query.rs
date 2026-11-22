use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Node {
	And {
		children: Vec<Node>,
	},
	Or {
		children: Vec<Node>,
	},
	Not {
		child: Box<Node>,
	},
	Text {
		value: String,
		#[serde(default)]
		phrase: bool,
	},
	Regex {
		pattern: String,
	},
	Filter {
		name: String,
		#[serde(default)]
		argument: Option<Box<Node>>,
	},
	Property {
		key: String,
		#[serde(default)]
		expression: Option<Box<Node>>,
	},
	Compare {
		operator: String,
		value: String,
	},
	Null,
}
