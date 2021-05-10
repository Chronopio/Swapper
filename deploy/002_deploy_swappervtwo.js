module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  await deploy('SwapperV2', {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ['SwapperV2'];