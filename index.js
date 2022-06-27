import axios from 'axios';
import dotenv from 'dotenv';

const location = 'Belfast';
const language = 'JavaScript';
const page = 1;
const perPage = 100;

dotenv.config();

const ysUsL = [];

/**
   * @description - This function is used to find the developers
   * who have worked in
   * the same year as the user.
  */
function findDevelopers() {
  // eslint-disable-next-line max-len
  const q = `q=location:${location}}&language:${language}&page=${page}&per_page=${perPage}`;
  const url = `https://api.github.com/search/users?${q}`;
  const token = 'token ' + process.env.GITHUB_TOKEN;
  const headers = {
    'Authorization': token,
  };
  const userList = [];
  axios.get(url, {headers})
      .then((response) => {
        if (response.data.items.length > 0) {
          response.data.items.forEach((user) => {
            if (user.public_repos < 20) {
            } else {
              userList.push(user);
            }
          });
        }
        userList.forEach((user) => {
          const userHireable = `https://api.github.com/users/${user.login}`;
          axios.get(userHireable, {headers})
              .then((response) => {
                if (response.data.hireable) {
                  const userUrl = `https://api.github.com/users/${user.login}/repos`;
                  axios.get(userUrl, {headers})
                      .then((response) => {
                        const repos = response.data.slice(0, 20);
                        repos.forEach((repo) => {
                          const repoUrl = `https://api.github.com/repos/${user.login}/${repo.name}/commits`;
                          axios.get(repoUrl, {headers})
                              .then((rsp) => {
                                if (repo.language === 'JavaScript') {
                                  const fC = rsp.data[0];
                                  const lC = rsp.data[rsp.data.length - 1];
                                  const fD = new Date(fC.commit.author.date);
                                  const lD = new Date(lC.commit.author.date);
                                  const fDY = fD.getFullYear();
                                  const lDYear = lD.getFullYear();
                                  const ys = fDY - lDYear;
                                  if (ys > 2) {
                                    if (!ysUsL.includes(user.login)) {
                                      ysUsL.push(user.login);
                                    }
                                    if (ysUsL.includes(user.login)) {
                                      const i = ysUsL.indexOf(user.login);
                                      if (ys > ysUsL[i]) {
                                        ysUsL[i] = ys;
                                      }
                                    }
                                  }
                                }
                                console.log(ysUsL);
                              })
                              .catch((error) => {
                                console.log(error);
                              },
                              );
                        },
                        );
                      },
                      );
                }
              })
              .catch((error) => {
                console.log(error);
              },
              );
        });
      },
      )
      .catch((error) => {
        // console.log(error);
      },
      );
}

findDevelopers();
