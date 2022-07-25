var inquirer = require("inquirer");
const { allowedNodeEnvironmentFlags } = require("process");
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "tracker",
    password: "devpassword",
    database: "employee_tracker"
})

const promptUser = () => {
  return (
    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "what would you like to do?",
          choices: [
            "View all Employees",
            "Add Employees",
            "Add Employee",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Departments",
            "Quit",
          ],
        },
      ])

      // responses to answers
      .then((answers) => {
        const { name } = answers;
        if (name === "View all Employees") {
          viewEmployees();
        }

        if (name === "Add Employee Role") {
          addEmployee();
        }

        if (name === "View All Roles") {
          viewRoles();
        }

        if (name === "Add Role") {
          addRole();
        }

        if (name === "View All Departments") {
          viewDepartments();
        }

        if (name === "Add Departments") {
          addDepartments();
        }
      })
  );
};

//function to show all data on selected table
viewDepartments = () => {
  const sql = `SELECT department.id AS id, department.name AS department 
    FROM department`;

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

viewRoles = () => {
  const sql = `SELECT role.id, role.title, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

viewEmployees = () => {
  const sql = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                 FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

//functions to add a data point
//function to add an employee 
addEmployee = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'fistName',
        message: "What is the employee's first name?",
        validate: addFirst => {
          if (addFirst) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: addLast => {
          if (addLast) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
      .then(answer => {
      const params = [answer.fistName, answer.lastName]
  
      //get roles from roles table
      const roleSql = `SELECT role.id, role.title FROM role`;
    
      connection.promise().query(roleSql, (err, data) => {
        if (err) throw err; 
        
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
  
        inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
              .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role);
  
                const managerSql = `SELECT * FROM employee`;
  
                connection.promise().query(managerSql, (err, data) => {
                  if (err) throw err;
  
                  const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
  
                  // console.log(managers);
  
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'manager',
                      message: "Who is the employee's manager?",
                      choices: managers
                    }
                  ])
                    .then(managerChoice => {
                      const manager = managerChoice.manager;
                      params.push(manager);
  
                      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;
  
                      connection.query(sql, params, (err, result) => {
                      if (err) throw err;
                      console.log("Employee has been added")
  
                      showEmployees();
                });
              });
            });
          });
       });
    });
  };

  promptUser();