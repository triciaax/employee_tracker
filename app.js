var inquirer = require("inquirer");
const fs = require("fs");
const generatePage = require("./src/page-template");
const { allowedNodeEnvironmentFlags } = require("process");

// const pageHTML = generatePage(name, github);

// fs.writeFile('./index.html', pageHTML, err => {
//   if (err) throw err;

//   console.log('Portfolio complete! Check out index.html to see the output!');
// });

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
        const { choices } = answers;

        if (choices === "View All Employees") {
          viewEmployees();
        }

        if (choices === "Add Employee Role") {
          addEmployee();
        }

        if (choices === "View All Roles") {
          viewRoles();
        }

        if (choices === "Add Role") {
          addRole();
        }

        if (choices === "View All Departments") {
          viewDepartments();
        }

        if (choices === "Add Departments") {
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

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};
